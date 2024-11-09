/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const OverviewLazyImport = createFileRoute('/overview')()
const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const OverviewLazyRoute = OverviewLazyImport.update({
  path: '/overview',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/overview.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/overview': {
      id: '/overview'
      path: '/overview'
      fullPath: '/overview'
      preLoaderRoute: typeof OverviewLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/overview': typeof OverviewLazyRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/overview': typeof OverviewLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/overview': typeof OverviewLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/overview'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/overview'
  id: '__root__' | '/' | '/overview'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  OverviewLazyRoute: typeof OverviewLazyRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  OverviewLazyRoute: OverviewLazyRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/overview"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/overview": {
      "filePath": "overview.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */