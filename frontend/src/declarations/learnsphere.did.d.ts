import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Quest {
  'id' : bigint,
  'title' : string,
  'rewardAmount' : bigint,
  'link' : string,
  'description' : string,
  'prerequisite' : [] | [bigint],
  'category' : string
}
export interface UserStats {
  'experience' : bigint,
  'questsCompleted' : Array<bigint>,
  'tokens' : bigint,
}
export interface _SERVICE {
  'completeQuest' : ActorMethod<[bigint], string>,
  'getAllQuests' : ActorMethod<[], Array<Quest>>,
  'getAllQuestsWithStatus' : ActorMethod<[], Array<[Quest, string]>>,
  'getNextQuest' : ActorMethod<[], [] | [Quest]>,
  'getQuestById' : ActorMethod<[bigint], [] | [Quest]>,
  'getQuestCount' : ActorMethod<[], bigint>,
  'getUserStats' : ActorMethod<[], UserStats>,
  'greet' : ActorMethod<[string], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
