import React, { Fragment, useState, useEffect, useReducer } from 'react';
import axios from 'axios';

const dataFetchReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, isLoading: true, isError: false };
        case 'FETCH_SUCCESS':
            return { ...state, isLoading: false, isError: false, data: action.payload };
        case 'FETCH_FAILURE':
            return { ...state, isLoading: false, isError: true };
        default:
            throw new Error();
    }
};

const useDataApi = (initialUrl, initialData) => {
    const [url, setUrl] = useState(initialUrl);

    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData
    });

    useEffect(() => {
        let didCancel = false;
        const fetchData = async () => {
            dispatch({ type: 'FETCH_INIT' });
            try {
                const result = await axios(url);
                if (!didCancel) {
                    console.log('only dispatch for the last time')
                    dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
                } else {
                    console.log(`handler cancelled: ${url}`)
                }
            } catch (error) {
                if (!didCancel) {
                    dispatch({ type: 'FETCH_FAILURE' });
                } else {
                    console.log(`handler cancelled: ${url}`)
                }
            }
        }

        const debounceTimeout = setTimeout(() => {
            fetchData();
        }, 300);


        return () => {
            didCancel = true;
            clearTimeout(debounceTimeout)
        }
    }, [url])
    return [state, setUrl];
};

function UsingHooks() {
    const [query, setQuery] = useState('redux');
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
        'https://hn.algolia.com/api/v1/search?query=redux',
        { hits: [] }
    );

    return (
        <Fragment>
            <input type='text' value={query} onChange={
                event => {
                    setQuery(event.target.value);
                    doFetch(`https://hn.algolia.com/api/v1/search?query=${event.target.value}`)
                }
            } />
            {isError && <div>Something went wrong...</div>}
            {isLoading ? (<div>Loading...</div>) : (
                <ul>
                    {data.hits.map(item => (
                        <li key={item.objectID}>
                            <a href={item.url}>{item.title}</a>
                        </li>
                    ))}
                </ul>
            )}
        </Fragment>
    );
}

export default UsingHooks;