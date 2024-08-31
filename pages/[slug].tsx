import Head from "next/head";
import Container from "../components/container";
import Layout from "../components/layout";
import Block from "../components/block";
import Header from "../components/header";
import { GetStaticPaths, GetStaticProps } from "next";
import { getAllPagesWithSlug, getPageBySlug, getMenuItems, getPostsById } from "../lib/api";

export default function Page({ page, preview, menuItems }) {
  const { title, editorBlocks } = page;
  // console.log(page);

  return (
    <Layout preview={preview}>
      <Head>
        <title>{title}</title>
      </Head>
      <Container>
        <Header items={menuItems} />
        <div className="page">
          {editorBlocks ? (
            editorBlocks.map((block, index) => (
              <Block block={block} key={index} />
            ))
          ) : null}
        </div>
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const data = await getPageBySlug(params?.slug, preview, previewData);
  const menu = await getMenuItems('HEADER');
  
  await Promise.all(
    data.page.editorBlocks.map(async (block) => {
      if (block.name === 'create-block/dynamic-post-selector' && block.attributes.selectedPosts !== null) {
        const postsArray = JSON.parse(block.attributes.selectedPosts);
        block.attributes.posts = await getPostsById(postsArray);
      }
    })
  );

  return {
    props: {
      page: data.page,
      preview,
      menuItems: menu?.menuItems.edges ?? {},
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPages = await getAllPagesWithSlug();

  return {
    paths: allPages.edges.map(({ node }) => `/${node.slug}`) || [],
    fallback: true,
  };
};
