import fs from "fs";
import { BskyAgent, RichText } from "@atproto/api";
const agent = new BskyAgent({ service: "https://bsky.social/" });

type Post = {
	postUrl: string;
	title: string;
	author: string;
	imageUrl: string;
	path: string;
};

async function postToBsky(post: Post) {
	const { postUrl, title, author, imageUrl, path } = post;
	await agent.login({
		identifier: process.env.BLUESKY_BOT_EMAIL || "email",
		password: process.env.BLUESKY_BOT_PASSWORD || "password",
	});
	const data = fs.readFileSync(path);
	const resp = await agent.uploadBlob(data, {
		encoding: "image/jpeg",
	});
	if (!resp.success) {
		const msg = `Unable to upload image ${path}`;
		console.error(msg, resp);
		throw new Error(msg);
	}
	const {
		data: { blob: image },
	} = resp;

	const text = `${title}\nby u/${author}\n`;
	const rt = new RichText({
		text,
		facets: [
			{
				index: { byteStart: 0, byteEnd: text.indexOf("\nby ") },
				features: [{ $type: "link", uri: `https://reddit.com/${postUrl}` }],
			},
			{
				index: {
					byteStart: text.indexOf(" u/") + 1,
					byteEnd: text.length,
				},
				features: [{ $type: "link", uri: `https://reddit.com/u/${author}` }],
			},
		],
	});
	// await rt.detectFacets(agent);
	await agent.post({
		text: rt.text,
		facets: rt.facets,
		embed: {
			$type: "app.bsky.embed.images",
			images: [{ image, alt: title }],
		},
	});
	console.log("done");
}

export { postToBsky };
