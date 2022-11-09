import * as React from 'react';
import { ReferenceField, useRedirect } from 'react-admin';
import { Box, Card, Typography } from '@mui/material';
import { Draggable } from 'react-beautiful-dnd';

import { LogoField } from '../companies/LogoField';
import { Component } from '../types';

export const ComponentCard = ({
    component,
    index,
}: {
    component: Component;
    index: number;
}) => {
    const redirect = useRedirect();
    if (!component) return null;

    const handleClick = () => {
        redirect(`/components/${component.id}/show`);
    };

    return (
        <Draggable draggableId={String(component.id)} index={index}>
            {(provided, snapshot) => (
                <Box
                    sx={{ marginBottom: 1 }}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    onClick={handleClick}
                >
                    <Card
                        style={{
                            opacity: snapshot.isDragging ? 0.9 : 1,
                            transform: snapshot.isDragging
                                ? 'rotate(-2deg)'
                                : '',
                        }}
                        elevation={snapshot.isDragging ? 3 : 1}
                    >
                        <Box padding={1} display="flex">
                            {/*<ReferenceField*/}
                            {/*    source="company_id"*/}
                            {/*    record={component}*/}
                            {/*    reference="companies"*/}
                            {/*>*/}
                            {/*    <LogoField size="small" />*/}
                            {/*</ReferenceField>*/}
                            <Box sx={{ marginLeft: 1 }}>
                                <Typography variant="body2" gutterBottom>
                                    {component.componentId}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    {component.envId}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    {component.branchName}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    {component.buildTime}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    {component.componentVersion}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    {component.commitId}
                                </Typography>
                                {/*<Typography*/}
                                {/*    variant="caption"*/}
                                {/*    color="textSecondary"*/}
                                {/*>*/}
                                {/*    {component.amount.toLocaleString('en-US', {*/}
                                {/*        notation: 'compact',*/}
                                {/*        style: 'currency',*/}
                                {/*        currency: 'USD',*/}
                                {/*        currencyDisplay: 'narrowSymbol',*/}
                                {/*        minimumSignificantDigits: 3,*/}
                                {/*    })}*/}
                                {/*    , {component.type}*/}
                                {/*</Typography>*/}
                            </Box>
                        </Box>
                    </Card>
                </Box>
            )}
        </Draggable>
    );
};
