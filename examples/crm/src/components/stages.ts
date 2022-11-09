export const stages = [
    'dev',
    'qa',
    'stage',
    'prod',
    // 'lost',
    // 'delayed',
];

export const stageNames = {
    dev: 'Dev',
    qa: 'Qa',
    stage: 'Stage',
    prod: 'Prod',
    // lost: 'Lost',
    // delayed: 'Delayed',
};

export const stageChoices = stages.map(type => ({
    id: type,
    /* @ts-ignore */
    name: stageNames[type],
}));
