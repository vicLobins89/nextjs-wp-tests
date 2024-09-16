import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import Intro from "../../components/intro";
import Layout from "../../components/layout";
import { CMS_NAME } from "../../lib/constants";
import LoadMorePost from "../../components/load-more";
import LoadPosts from "../../components/load-posts";

export default function Index({ preview }) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>{`Next.js Blog Example with ${CMS_NAME}`}</title>
      </Head>
      <Container>
        <Intro />
        {/* <LoadMorePost /> */}
        <LoadPosts />
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  return {
    props: {  preview },
    revalidate: 10,
  };
};
