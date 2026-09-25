import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link href="/fonts/sailors-slant.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
          <link href="/fonts/NeueHaasDisplayRoman.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
          <link href="/fonts/NeueHaasDisplayLight.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
          <link href="/fonts/NeueHaasDisplayMedium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
          <link href="/fonts/happyboys-regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
          <link href="/fonts/kaftan-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
