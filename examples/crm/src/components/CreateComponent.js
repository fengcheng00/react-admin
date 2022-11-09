import React from 'react';
import { Controller } from 'react-hook-form';
import { Title, SimpleForm, SelectInput, useRedirect } from 'react-admin';
import { Card, TextField, Dialog } from '@mui/material';

export function CreateComponent(props) {
    const redirect = useRedirect();
    const handleClose = () => {
        redirect('/components');
    };

    const onSubmit = async data => {
        console.log(data);

        fetch(
            `https://c1-proxy.dev-usa-gke.int.cision.com/api/envs/${data.environment}`,
            {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    componentId: data.componentId,
                    envURL: data.envURL,
                }),
            }
        )
            .then(data => {
                console.log(data);
                if (data.status === 200) {
                    alert('Environment created succesfully.');
                    handleClose();
                } else {
                    alert('Request failed.');
                }
            })
            .catch(error => {
                console.log(error);
            });
    };

    return (
        <Dialog open={props.open} onClose={handleClose}>
            <div>
                <Title title="Add Environment" />
                <Card>
                    <SimpleForm onSubmit={onSubmit}>
                        <Controller
                            name="environment"
                            render={({ field }) => (
                                <SelectInput
                                    source="environment"
                                    choices={[
                                        { id: 'dev', name: 'dev' },
                                        { id: 'qa', name: 'qa' },
                                        { id: 'stage', name: 'stage' },
                                        { id: 'prod', name: 'prod' },
                                    ]}
                                />
                            )}
                        />

                        <Controller
                            name="componentId"
                            render={({ field }) => (
                                <TextField label="Component" {...field} />
                            )}
                        />

                        <Controller
                            name="envURL"
                            render={({ field }) => (
                                <TextField label="URL" {...field} />
                            )}
                        />
                    </SimpleForm>
                </Card>
            </div>
        </Dialog>
    );
}
