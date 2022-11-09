import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { Droppable } from 'react-beautiful-dnd';
import { Identifier } from 'react-admin';

import { ComponentCard } from './ComponentCard';
import { stageNames } from './stages';
import { RecordMap } from './ComponentListContent';

export const ComponentColumn = ({
    stage,
    componentIds,
    data,
}: {
    stage: string;
    componentIds: Identifier[];
    data: RecordMap;
}) => {
    return (
        <Box
            sx={{
                flex: 1,
                paddingTop: '8px',
                paddingBottom: '16px',
                bgcolor: '#eaeaee',
                '&:first-child': {
                    paddingLeft: '5px',
                    borderTopLeftRadius: 5,
                },
                '&:last-child': {
                    paddingRight: '5px',
                    borderTopRightRadius: 5,
                },
            }}
        >
            <Typography align="center" variant="subtitle1">
                {/* @ts-ignore */}
                {stageNames[stage]}
            </Typography>
            <Droppable droppableId={stage}>
                {(droppableProvided, snapshot) => (
                    <Box
                        ref={droppableProvided.innerRef}
                        {...droppableProvided.droppableProps}
                        className={
                            snapshot.isDraggingOver ? ' isDraggingOver' : ''
                        }
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 5,
                            padding: '5px',
                            '&.isDraggingOver': {
                                bgcolor: '#dadadf',
                            },
                        }}
                    >
                        {componentIds.map((id, index) => (
                            <ComponentCard
                                component={data[id]}
                                index={index}
                                key={id}
                            />
                        ))}
                        {droppableProvided.placeholder}
                    </Box>
                )}
            </Droppable>
        </Box>
    );
};
