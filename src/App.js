import React, {Component} from 'react';
import {BrowserRouter, Route} from 'react-router-dom'
import {uuid, objsToListsOnKey} from "./utils/utils";
import * as navContainer from './components/app/app.nav.json';
import {isEmpty, error, log} from 'fjl';

import AppNav from "./components/app/AppNav";

const

    lazyAsyncComponent = (fetchComponent = () => (Promise.resolve({})), props = {}) => {
        return class LazyAsyncComponent extends Component {
            state = {FetchedComponent: null};
            componentWillMount() {
                fetchComponent().then(({ default: component }) => {
                    this.setState({ FetchedComponent: component });
                });
            }
            render() {
                const { FetchedComponent } = this.state;
                return FetchedComponent ? <FetchedComponent {...props} /> : null;
            }
        };
    }
;

class App extends Component {

    static defaultProps = {
        viewsElmVisbleClassName: 'visible'
    };

    static onLinkClick (e, altDetail) {
        if (!altDetail) {
            e.preventDefault();
        }
        else if (altDetail.awaitingTransition === false) {
            return;
        }
        const viewsElm = this.viewsElmRef.current,
            handler = e => {
                log('transition completed');
                this.boundOnLinkClick(e, {awaitingTransition: false});
                viewsElm.classList.remove(this.props.viewsElmVisbleClassName);
                viewsElm.removeEventListener('transitionend', handler);
            };
        log('awaiting transition');
        viewsElm.addEventListener('transitionend', handler);
        viewsElm.classList.remove(this.props.viewsElmVisbleClassName);
    }

    static renderRoutes(navContainer) {
        return isEmpty(navContainer.items) ?
            null : objsToListsOnKey('items', navContainer).items.map(item => {
                const uriParts = item.uri.split('/'),
                    filePathParts = item.componentFilePath.split('/'),
                    aliasName = uriParts.length ? uriParts[uriParts.length - 1] : null;
                return (
                    <Route
                        key={uuid('route-')}
                        path={item.uri}
                        component={
                            lazyAsyncComponent(
                                () => import(item.componentFilePath + '.jsx').catch(error),
                                {
                                    fileName: filePathParts[filePathParts.length - 1] + '.jsx',
                                    aliasName,
                                    canvasId: aliasName
                                }
                            )
                        }
                        {...item.reactRouterRouteParams}
                    />
                );
            });
    }

    constructor (props) {
        super(props);
        this.boundOnLinkClick = App.onLinkClick.bind(this);
        this.viewsElmRef = React.createRef();
    }

    render() {
        return (
            <BrowserRouter>
                <div id="wrapper" className="clearfix">
                    <header>
                        <div>
                            <div className="logo">
                                <div>
                                    <a className="hamburger-btn">
                                        <div className="slice">&nbsp;</div>
                                        <div className="slice">&nbsp;</div>
                                        <div className="slice">&nbsp;</div>
                                    </a>
                                    <h1><a href="#">WebGl Programming Guide Book Examples</a></h1>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main>
                        <div>
                            <AppNav navContainer={navContainer} {/*onLinkClick={this.boundOnLinkClick}*/} />
                            <section ref={this.viewsElmRef}
                                     className="canvas-experiment-view">
                                {App.renderRoutes(navContainer)}
                            </section>
                        </div>
                    </main>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
