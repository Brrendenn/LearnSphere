export const idlFactory = ({ IDL }) => {
  const Quest = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'rewardAmount' : IDL.Nat,
    'link' : IDL.Text,
    'description' : IDL.Text,
    'prerequisite' : IDL.Opt(IDL.Nat),
  });
  const UserStats = IDL.Record({
    'experience' : IDL.Nat,
    'questsCompleted' : IDL.Vec(IDL.Nat),
    'tokens' : IDL.Nat,
  });
  return IDL.Service({
    'completeQuest' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'getAllQuests' : IDL.Func([], [IDL.Vec(Quest)], ['query']),
    'getAllQuestsWithStatus' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(Quest, IDL.Text))],
        [],
      ),
    'getNextQuest' : IDL.Func([], [IDL.Opt(Quest)], []),
    'getQuestById' : IDL.Func([IDL.Nat], [IDL.Opt(Quest)], ['query']),
    'getQuestCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getUserStats' : IDL.Func([], [UserStats], []),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
