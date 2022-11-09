import * as React from 'react';
import {
    CreateButton,
    ExportButton,
    FilterButton,
    List,
    SearchInput,
    SelectInput,
    TopToolbar,
    useGetIdentity,
} from 'react-admin';
import { matchPath, useLocation } from 'react-router';

import { ComponentListContent } from './ComponentListContent';
// import { DealCreate } from './DealCreate';
import { ComponentShow } from './ComponentShow';
import { CreateComponent } from './CreateComponent';
import { OnlyMineInput } from './OnlyMineInput';
import { typeChoices } from './types';

export const ComponentList = () => {
    const { identity } = useGetIdentity();
    const location = useLocation();
    const matchCreate = matchPath('/components/create', location.pathname);
    // const matchShow = matchPath('/components/:id/show', location.pathname);
    if (!identity) return null;
    return (
        <>
            <List
                perPage={100}
                sort={{ field: 'index', order: 'ASC' }}
                filters={componentFilters}
                filterDefaultValues={{ sales_id: identity && identity?.id }}
                actions={<ComponentActions />}
                pagination={false}
                component="div"
            >
                <ComponentListContent />
            </List>
            {<CreateComponent open={!!matchCreate} />}
            {/*<ComponentShow open={!!matchShow} id={matchShow?.params.id} />*/}
        </>
    );
};

const componentFilters = [
    <SearchInput source="q" alwaysOn />,
    // <OnlyMineInput alwaysOn />,
    // <SelectInput source="type" choices={typeChoices} />,
];

const ComponentActions = () => {
    return (
        <TopToolbar>
            <FilterButton />
            <ExportButton />
            <CreateButton
                variant="contained"
                label="New Component"
                sx={{ marginLeft: 2 }}
            />
        </TopToolbar>
    );
};
