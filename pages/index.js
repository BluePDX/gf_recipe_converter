import { useState } from 'react';
import Head from 'next/head';
import RecipeConverter from '../components/RecipeConverter';

export default function Home() {
  return (
    <>
      <Head>
        <title>Gluten-Free Recipe Converter</title>
        <meta name="description" content="Convert any recipe to gluten-free with smart, context-aware substitutions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <RecipeConverter />
    </>
  );
}
