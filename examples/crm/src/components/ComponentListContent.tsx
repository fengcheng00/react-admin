import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { Identifier, useListContext, DataProviderContext } from 'react-admin';
import { Box } from '@mui/material';
import { DragDropContext, OnDragEndResponder } from 'react-beautiful-dnd';
import isEqual from 'lodash/isEqual';

import { ComponentColumn } from './ComponentColumn';
import { stages } from './stages';
import { Component } from '../types';

export interface RecordMap {
    [id: number]: Component;
    [id: string]: Component;
}

interface ComponentsByColumn {
    [stage: string]: Identifier[];
}

const initialComponents: ComponentsByColumn = stages.reduce(
    (obj, stage) => ({ ...obj, [stage]: [] }),
    {}
);

// const initialComponents: ComponentsByColumn = {};

const getComponentsByColumn = (data: Component[]): ComponentsByColumn => {
    // group components by column

    const columns = data
        .filter(item => item.envId !== 'undefined')
        .reduce(
            (acc, record) => {
                acc[record.envId].push(record);
                return acc;
            },
            stages.reduce((obj, stage) => ({ ...obj, [stage]: [] }), {} as any)
        );
    // order each column by index
    stages.forEach(stage => {
        columns[stage] = columns[stage]
            .sort(
                (recordA: Component, recordB: Component) =>
                    Number(recordA.id) - Number(recordB.id)
            )
            .map((deal: Component) => deal.id);
    });
    return columns;
};

const indexById = (data: Component[]): RecordMap =>
    data.reduce((obj, record) => ({ ...obj, [record.id]: record }), {});

export const ComponentListContent = () => {
    const { data: unorderedDeals, isLoading, refetch } = useListContext<
        Component
    >();

    const [data, setData] = useState<RecordMap>(
        isLoading ? {} : indexById(unorderedDeals)
    );
    const [components, setComponents] = useState<ComponentsByColumn>(
        isLoading ? initialComponents : getComponentsByColumn(unorderedDeals)
    );
    // we use the raw dataProvider to avoid too many updates (which would create junk)
    const dataProvider = useContext(DataProviderContext);

    // update deals by columns when the dataProvider response updates
    useEffect(() => {
        if (isLoading) return;
        const newDeals = getComponentsByColumn(unorderedDeals);
        // if (isEqual(components, newDeals)) {
        //     return;
        // }
        setComponents(newDeals);
        setData(indexById(unorderedDeals));
    }, [unorderedDeals, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    if (isLoading) return null;

    const onDragEnd: OnDragEndResponder = async result => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            // moving deal inside the same column

            const column = Array.from(components[source.droppableId]); // [4, 7, 23, 5] array of ids
            const sourceDeal = data[column[source.index]];
            const destinationDeal = data[column[destination.index]];

            // update local state
            // remove source deal from column
            column.splice(source.index, 1);
            // read source deal at destination
            column.splice(destination.index, 0, Number(draggableId));
            setComponents({
                ...components,
                [source.droppableId]: column,
            });

            // update backend
            // Fetch all the deals in this stage (because the list may be filtered, but we need to update even non-filtered deals)
            const { data: columnDeals } = await dataProvider.getList(
                'components',
                {
                    sort: { field: 'index', order: 'ASC' },
                    pagination: { page: 1, perPage: 100 },
                    filter: { stage: source.droppableId },
                }
            );

            if (source.index > destination.index) {
                // deal moved up, eg
                // dest   src
                //  <------
                // [4, 7, 23, 5]

                await Promise.all([
                    // for all deals between destination.index and source.index, increase the index
                    ...columnDeals
                        .filter(
                            deal =>
                                deal.index >= destinationDeal.index &&
                                deal.index < sourceDeal.index
                        )
                        .map(deal =>
                            dataProvider.update('deals', {
                                id: deal.id,
                                data: { index: deal.index + 1 },
                                previousData: deal,
                            })
                        ),
                    // for the deal that was moved, update its index
                    dataProvider.update('deals', {
                        id: sourceDeal.id,
                        data: { index: destinationDeal.index },
                        previousData: sourceDeal,
                    }),
                ]);

                refetch();
            } else {
                // deal moved down, e.g
                // src   dest
                //  ------>
                // [4, 7, 23, 5]

                await Promise.all([
                    // for all deals between source.index and destination.index, decrease the index
                    ...columnDeals
                        .filter(
                            deal =>
                                deal.index <= destinationDeal.index &&
                                deal.index > sourceDeal.index
                        )
                        .map(deal =>
                            dataProvider.update('deals', {
                                id: deal.id,
                                data: { index: deal.index - 1 },
                                previousData: deal,
                            })
                        ),
                    // for the deal that was moved, update its index
                    dataProvider.update('deals', {
                        id: sourceDeal.id,
                        data: { index: destinationDeal.index },
                        previousData: sourceDeal,
                    }),
                ]);

                refetch();
            }
        } else {
            // moving deal across columns

            const sourceColumn = Array.from(components[source.droppableId]); // [4, 7, 23, 5] array of ids
            const destinationColumn = Array.from(
                components[destination.droppableId]
            ); // [4, 7, 23, 5] arrays of ids
            const sourceDeal = data[sourceColumn[source.index]];
            const destinationDeal = data[destinationColumn[destination.index]]; // may be undefined if dropping at the end of a column

            // update local state
            sourceColumn.splice(source.index, 1);
            destinationColumn.splice(destination.index, 0, draggableId);
            setComponents({
                ...components,
                [source.droppableId]: sourceColumn,
                [destination.droppableId]: destinationColumn,
            });

            // update backend
            // Fetch all the deals in both stages (because the list may be filtered, but we need to update even non-filtered deals)
            const [
                { data: sourceDeals },
                { data: destinationDeals },
            ] = await Promise.all([
                dataProvider.getList('deals', {
                    sort: { field: 'index', order: 'ASC' },
                    pagination: { page: 1, perPage: 100 },
                    filter: { stage: source.droppableId },
                }),
                dataProvider.getList('deals', {
                    sort: { field: 'index', order: 'ASC' },
                    pagination: { page: 1, perPage: 100 },
                    filter: { stage: destination.droppableId },
                }),
            ]);

            await Promise.all([
                // decrease index on the deals after the source index in the source columns
                ...sourceDeals
                    .filter(deal => deal.index > sourceDeal.index)
                    .map(deal =>
                        dataProvider.update('deals', {
                            id: deal.id,
                            data: { index: deal.index - 1 },
                            previousData: deal,
                        })
                    ),
                // increase index on the deals after the destination index in the destination columns
                ...destinationDeals
                    .filter(deal =>
                        destinationDeal
                            ? deal.index >= destinationDeal.index
                            : false
                    )
                    .map(deal =>
                        dataProvider.update('deals', {
                            id: deal.id,
                            data: { index: deal.index + 1 },
                            previousData: deal,
                        })
                    ),
                // change the dragged deal to take the destination index and column
                dataProvider.update('deals', {
                    id: sourceDeal.id,
                    data: {
                        index: destinationDeal
                            ? destinationDeal.index
                            : destinationDeals.pop()!.index + 1,
                        stage: destination.droppableId,
                    },
                    previousData: sourceDeal,
                }),
            ]);

            refetch();
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Box display="flex">
                {stages.map(env => (
                    <ComponentColumn
                        stage={env}
                        componentIds={components[env]}
                        data={data}
                        key={env}
                    />
                ))}
            </Box>
        </DragDropContext>
    );
};
