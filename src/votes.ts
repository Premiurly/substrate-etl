const { prisma } = require('./generated/prisma-client');

const wait = () => new Promise(r => {
	setTimeout(r, 1000)
});

async function start() {

	console.log('start');

	for (let i = 0; i <= 24; i++) {
		console.log(`processing ${i}`)
		await wait();

		const body = {
			"row": 100,
			"page": 0,
			"referendum_index": i
		};

		const result = await fetch("https://polkadot.subscan.io/api/scan/democracy/votes", {
			"headers": {
				"accept": "application/json, text/plain, */*",
				"accept-language": "en",
				"content-type": "application/json;charset=UTF-8",
				"sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
				"sec-ch-ua-mobile": "?0",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"cookie": "_ga=GA1.2.373893696.1615810717; __gads=ID=719a8ea82f697fe1-22f2d006c8ba0095:T=1615810718:RT=1615810718:S=ALNI_Maikj6BaNzar0UggfrRoUNB-4cQzg; banner=true; __cfduid=d729b35ad5eae5a6c9af7f724dccd64191618817702; local_language=en; _gid=GA1.2.943938073.1618899540; _gat_UA1525613143=1; _gat_UA1525613147=1"
			},
			"referrer": `https://polkadot.subscan.io/referenda_vote/${i}`,
			"referrerPolicy": "origin-when-cross-origin",
			"body": JSON.stringify(body),
			"method": "POST",
			"mode": "cors"
		});

		const json = await result.json();

		console.log(JSON.stringify(json, null, 2));

		if (json.data?.list?.length) {
			json.data.list.forEach(async (row: any) => {
				const r = await prisma.createVote({
					proposalType: 'referendum',
					proposalId: i,
					address: row.account?.address,
					addressDisplay: row.account?.display,
					vote: row.passed ? 'AYE' : 'NAY',
					amount: row.amount,
					conviction: row.conviction
				});
				console.log(r);
			})
		}
	}
}

start().catch(console.error)