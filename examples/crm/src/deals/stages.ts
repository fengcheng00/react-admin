export const stages = [
    'opportunity',
    'proposal-sent',
    'in-negociation',
    'won',
    // 'lost',
    // 'delayed',
];

export const stageNames = {
    opportunity: 'Dev',
    'proposal-sent': 'Qa',
    'in-negociation': 'Stage',
    won: 'Prod',
    // lost: 'Lost',
    // delayed: 'Delayed',
};

export const stageChoices = stages.map(type => ({
    id: type,
    /* @ts-ignore */
    name: stageNames[type],
}));
