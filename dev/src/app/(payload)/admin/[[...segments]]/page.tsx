/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

import { RootPage } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../importMap'
import { Metadata } from 'next'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Payload Admin',
  }
}

const Page = async ({ params, searchParams }: Args) => {
  const { segments } = await params
  return <RootPage config={config} params={{ segments }} searchParams={await searchParams} importMap={importMap} />
}

export default Page