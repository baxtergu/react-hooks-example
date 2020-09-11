import React, { Component, Fragment } from 'react'
import axios from 'axios';

export default class UsingClass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: { hits: [] },
            isLoading: false,
            isError: false,
            query: 'redux',
        }
        this.prevQuery = 'redux';
        this.currentFetch = null;
    }

    fetchData = url => {
        this.setState({ isLoading: true });
        let didCancel = false;
        let debounceTimeout = setTimeout(() => {
            axios(url).then(result => {
                if (!didCancel) {
                    this.setState({ data: result.data, isLoading: false });
                } else {
                    console.log(`handler cancelled for: ${url}`);
                }
            }).catch(error => {
                if (!didCancel) {
                    this.setState({ isLoading: false, isError: true });
                } else {
                    console.log(`handler cancelled for: ${url}`);
                }
            })
        }, 300);

        return {
            // 利用函数闭包每次返回 didCancel 的引用，用于取消请求返回后的处理函数
            cancel: () => {
                didCancel = true;
                clearTimeout(debounceTimeout);
            }
        };
    }

    componentDidMount() {
        const { query } = this.state;
        this.currentFetch = this.fetchData(`https://hn.algolia.com/api/v1/search?query=${query}`);
    }

    componentDidUpdate() {
        const { query } = this.state;
        if (query !== this.prevQuery) {
            // 执行一次请求后将 prevQuery 置为当前 query，避免 data 更新后的循环判断
            this.prevQuery = query;
            this.currentFetch.cancel();
            this.currentFetch = this.fetchData(`https://hn.algolia.com/api/v1/search?query=${query}`);
        }
    }

    handleInputChange = event => {
        const { query } = this.state;
        this.prevQuery = query;
        this.setState({ query: event.target.value });
    }

    render() {
        const { isLoading, isError, data, query } = this.state;
        return (
            <Fragment>
                <input type='text' value={query} onChange={this.handleInputChange} />
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
}
