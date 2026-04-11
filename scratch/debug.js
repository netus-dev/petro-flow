
const url = 'https://suthxuhsotxbyvadhdsc.supabase.co/rest/v1/functional_principles?limit=10&select=*';
const key = 'sb_publishable_oGjdzidHbsa8vl4IoODVcg_SBHKSGR3';

async function check() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

check();
