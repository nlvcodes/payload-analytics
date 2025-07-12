/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import React from 'react'

import { importMap } from './admin/importMap.js'
import config from '@payload-config'
import { RootLayout, generateServerFunctions } from '@payloadcms/next/layouts'

import '@payloadcms/next/css'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

const serverFunction = generateServerFunctions({
  config,
  importMap,
})

const Layout = ({ children }: Args) => (
  <RootLayout importMap={importMap} config={config} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout