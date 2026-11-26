import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import type { LineReference, MeterSet, PullRequest } from '../types';
import type { GroupCommand, GroupSettings, GroupSnapshot } from '../types/groupSessions';
import { evaluateDecision, type DecisionReceipt } from '../utils/decision';
import { normalizePullRequest } from '../utils/templateNormalization';
import { basicsDay, makeBasicsPR } from '../utils/basicsGame';
import { instantiatePullRequest } from '../utils/pr';
import { eagerTemplates, templateLoaders } from '../data/prs';

export class GroupError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
interface Seat { id: string; name: string; credentialHash: string; decisions: DecisionReceipt[]; meters: MeterSet; finishedAt: number | null }
export interface GroupRoom {
  code: string; hostHash: string; settings: GroupSettings; createdAt: number; expiresAt: number;
  startsAt: number | null; endsAt: number | null; finishedAt: number | null;
  prs: PullRequest[]; players: Seat[];
}
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export const newCredential = () => randomBytes(32).toString('base64url');
export const newRoomCode = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[randomInt(32)]).join('');
export const matchesCredential = (hash: string, token?: string) => {
  if (!token || token.length > 128) return false;
  const candidate = tokenHash(token);
  return hash.length === candidate.length && timingSafeEqual(Buffer.from(hash), Buffer.from(candidate));
};
export const parseSettings = (input: unknown): GroupSettings => {
  const value = input as Partial<GroupSettings> | null;
  if (!value || !['code','basics'].includes(value.track ?? '') || !['en','es'].includes(value.locale ?? '') ||
    ![120,300,600].includes(value.durationSeconds ?? 0) || !Number.isInteger(value.day) || value.day! < 1 || value.day! > 6) throw new GroupError(400,'invalid_settings');
  return { track: value.track!, locale: value.locale!, durationSeconds: value.durationSeconds!, day: value.track === 'code' ? 1 : value.day! };
};
export const createRoom = async (settings: GroupSettings, credential: string, now: number): Promise<GroupRoom> => {
  let prs: PullRequest[];
  if (settings.track === 'basics') {
    prs = basicsDay(settings.day)!.exercises.map((exercise,index) => makeBasicsPR(exercise,settings.day,1,settings.locale,index));
  } else {
    const codeTemplates = await templateLoaders.typescript();
    const pool = [...eagerTemplates, ...codeTemplates];
    const shuffle = <T,>(items: T[]) => {
      const result = [...items];
      for (let i=result.length-1;i>0;i--) { const j=randomInt(i+1); [result[i],result[j]]=[result[j],result[i]]; }
      return result;
    };
    const selected = shuffle([...shuffle(pool.filter(pr=>!pr.bugPatterns.length)).slice(0,5), ...shuffle(pool.filter(pr=>pr.bugPatterns.length)).slice(0,5)]);
    if (selected.length !== 10) throw new GroupError(503,'content_unavailable');
    prs = selected.map((template,index) => instantiatePullRequest(template,1,index,settings.locale));
  }
  // Persist the content snapshot so deploys cannot change an active room's answer key.
  prs = prs.map(pr => normalizePullRequest(pr));
  return { code:newRoomCode(), hostHash:tokenHash(credential), settings, createdAt:now, expiresAt:now+24*60*60*1000,
    startsAt:null, endsAt:null, finishedAt:null, prs, players:[] };
};
export const reconcileRoom = (room: GroupRoom, now: number) => {
  if (room.expiresAt <= now) throw new GroupError(410,'room_expired');
  if (room.startsAt !== null && room.finishedAt === null && (now >= room.endsAt! ||
    room.players.every(player=>player.finishedAt !== null))) room.finishedAt = Math.min(now,room.endsAt!);
};
const playerFor = (room: GroupRoom, token?: string) => room.players.find(player=>matchesCredential(player.credentialHash,token));
export const applyCommand = (room: GroupRoom, command: GroupCommand, auth: { host?: string; seat?: string }, now: number) => {
  reconcileRoom(room,now);
  const player = playerFor(room,auth.seat);
  if (command.action === 'join') {
    if (player) return; // Reconnecting never creates a second seat.
    if (room.startsAt !== null) throw new GroupError(409,'already_started');
    if (room.players.length >= 40) throw new GroupError(409,'room_full');
    if (typeof command.name !== 'string' || !auth.seat) throw new GroupError(400,'invalid_name');
    const name = command.name.normalize('NFKC').replace(/[\p{Cc}\p{Cf}]/gu,'').trim();
    if (!name || name.length > 32) throw new GroupError(400,'invalid_name');
    if (room.players.some(p=>p.name.toLocaleLowerCase()===name.toLocaleLowerCase())) throw new GroupError(409,'name_taken');
    room.players.push({id:randomUUID(),name,credentialHash:tokenHash(auth.seat),decisions:[],meters:{stability:100,velocity:100,satisfaction:100},finishedAt:null});
    return;
  }
  if (command.action === 'start' || command.action === 'finish') {
    if (!matchesCredential(room.hostHash,auth.host)) throw new GroupError(403,'host_only');
    if (command.action === 'start') {
      if (room.startsAt !== null) return; // Double-click/retry cannot restart the clock.
      if (!room.players.length) throw new GroupError(409,'empty_room');
      room.startsAt=now; room.endsAt=now+room.settings.durationSeconds*1000;
    } else {
      if (room.startsAt === null) throw new GroupError(409,'not_started');
      room.finishedAt ??= now;
    }
    return;
  }
  if (!player) throw new GroupError(403,'join_required');
  if (room.startsAt === null) throw new GroupError(409,'not_started');
  const existing = player.decisions.find(receipt=>receipt.prId===command.prId);
  // An identical retry is safe, but cannot change the original decision.
  if (existing) {
    if (existing.verdict !== command.verdict) throw new GroupError(409,'already_reviewed');
    return;
  }
  if (room.finishedAt !== null) throw new GroupError(409,'shift_finished');
  const pr = room.prs.find(item=>item.id===command.prId);
  if (!pr || !['approve','request-changes'].includes(command.verdict) || !Array.isArray(command.selectedRefs) || command.selectedRefs.length>200 ||
    command.selectedRefs.some(ref=>!ref || typeof ref.filename!=='string' || typeof ref.rowId!=='string')) throw new GroupError(400,'invalid_review');
  let receipt: DecisionReceipt;
  try { receipt = evaluateDecision(normalizePullRequest(pr),command.verdict,command.selectedRefs as LineReference[],player.meters); }
  catch { throw new GroupError(400,'invalid_review'); }
  player.decisions.push(receipt); player.meters=receipt.metersAfter;
  if (player.decisions.length === room.prs.length) player.finishedAt=now;
  reconcileRoom(room,now);
};
export const publicPR = (pr: PullRequest): PullRequest => ({
  id:pr.id, templateId:pr.templateId, title:pr.title, author:pr.author, authorId:pr.authorId,
  description:pr.description,tags:pr.tags,files:pr.files,importance:pr.importance,
  // The solo estimate includes a hidden bug multiplier. Public timing must use visible content only.
  estimatedReviewSeconds:Math.round(15+1.2*pr.files.reduce((total,file)=>total+file.lines.length,0)),bugPatterns:[]
});
const explanationFor = (pr: PullRequest, locale: 'en'|'es') => pr.learningContext?.explanation ??
  (pr.bugPatterns.map(bug=>bug.description).filter(Boolean).join(' ') || (pr.bugPatterns.length
    ? locale==='es'?'Revisa las líneas señaladas antes de aprobar este cambio.':'Review the flagged lines before approving this change.'
    : locale==='es'?'El cambio es seguro: no contiene problemas señalados.':'This change is safe: it contains no flagged issues.'));
const evidenceFor = (pr:PullRequest) => {
  const normalized=normalizePullRequest(pr);
  return normalized.files.flatMap(file=>file.lines.filter(line=>normalized.bugPatterns.some(bug=>bug.lineRefs.some(ref=>ref.filename===file.filename && ref.rowId===line.rowId)))
    .map(line=>({filename:file.filename,rowId:line.rowId,lineNumber:line.lineNumber,content:`${line.kind==='removal'?'−':'+'} ${line.content}`})));
};
export const snapshotRoom = (room: GroupRoom, auth: {host?:string;seat?:string}, now: number): GroupSnapshot => {
  reconcileRoom(room,now);
  const player=playerFor(room,auth.seat);
  const host=matchesCredential(room.hostHash,auth.host);
  const finished=room.finishedAt!==null;
  const phase=finished ? 'finished' : room.startsAt!==null ? 'playing' : 'lobby';
  // Visitors can join a lobby but cannot inspect an active room or its results.
  if (!host && !player && phase!=='lobby') throw new GroupError(403,'join_required');
  const results = finished ? room.players.map(p=>({
    id:p.id,name:p.name,rank:0,reviewed:p.decisions.length,correct:p.decisions.filter(r=>r.correct).length,
    correctApprovals:p.decisions.filter(r=>r.outcome==='clean-approval').length,
    correctRejections:p.decisions.filter(r=>r.outcome==='correct-rejection').length,
    missed:p.decisions.filter(r=>r.outcome==='buggy-approval').length,
    safeRejected:p.decisions.filter(r=>r.outcome==='false-positive').length,
    precise:p.decisions.filter(r=>r.bonusApplied).length
  })).sort((a,b)=>b.correct-a.correct || b.precise-a.precise || a.name.localeCompare(b.name)) : [];
  results.forEach((row,index)=>{row.rank=index>0 && row.correct===results[index-1].correct && row.precise===results[index-1].precise ? results[index-1].rank : index+1;});
  return {code:room.code,phase,settings:room.settings,serverNow:now,startsAt:room.startsAt,endsAt:room.endsAt,role:host?'host':player?'player':'visitor',
    players:room.players.map(p=>({id:p.id,name:p.name,reviewed:p.decisions.length,finished:p.finishedAt!==null})),total:room.prs.length,
    me:player ? {id:player.id,name:player.name,reviewedIds:player.decisions.map(r=>r.prId),meters:player.meters} : null,
    queue:phase==='playing' && player ? room.prs.filter(pr=>!player.decisions.some(r=>r.prId===pr.id)).map(publicPR) : [],results,
    recap:finished ? room.prs.map(pr=>({prId:pr.id,title:pr.title,correct:room.players.filter(p=>p.decisions.some(r=>r.prId===pr.id&&r.correct)).length,
      reviewed:room.players.filter(p=>p.decisions.some(r=>r.prId===pr.id)).length,expected:pr.bugPatterns.length?'request-changes':'approve',explanation:explanationFor(pr,room.settings.locale)})) : [],
    reviews:finished && player ? player.decisions.map(receipt=>{const pr=room.prs.find(item=>item.id===receipt.prId)!;return {pr:publicPR(pr),verdict:receipt.verdict,correct:receipt.correct,precise:receipt.bonusApplied,explanation:explanationFor(pr,room.settings.locale),evidence:evidenceFor(pr)};}) : []};
};
