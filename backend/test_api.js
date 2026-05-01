const axios = require('axios');

async function test() {
  try {
    const resAll = await axios.get('https://startaply.vercel.app/api/jobs?page=1&limit=20&search=government%20teacher');
    console.log('All Jobs:', resAll.data.length);

    const resGovt = await axios.get('https://startaply.vercel.app/api/jobs/government?page=1&limit=20&search=government%20teacher');
    console.log('Govt Jobs:', resGovt.data.length);

    const resCentral = await axios.get('https://startaply.vercel.app/api/jobs/government?page=1&limit=20&govtFilter=Central&search=government%20teacher');
    console.log('Central Jobs:', resCentral.data.length);
  } catch (err) {
    console.error(err.message);
  }
}
test();
