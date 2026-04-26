fetch('https://sekolah.devapi.id/sekolah?nama=sma&limit=1', {
  headers: {
    'Origin': 'https://0b6b75dd.bintangtqa.pages.dev'
  }
}).then(res => {
  console.log(res.headers);
}).catch(console.error);
