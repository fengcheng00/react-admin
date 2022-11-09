import fakerestDataProvider from 'ra-data-fakerest';

import generateData from './dataGenerator';

import jsonServerProvider from 'ra-data-json-server';
// const baseDataProvider = fakerestDataProvider(generateData(), true);

const baseDataProvider = jsonServerProvider(
    'https://c1-proxy.dev-usa-gke.int.cision.com/api'
);

export const dataProvider = new Proxy(baseDataProvider, {
    get: (target, name: string) => (resource: string, params: any) =>
        new Promise(resolve =>
            setTimeout(
                () => resolve(baseDataProvider[name](resource, params)),
                300
            )
        ),
});
