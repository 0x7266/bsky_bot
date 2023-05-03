import fs from "fs";
import { BskyAgent, RichText } from "@atproto/api";

const agent = new BskyAgent({ service: "https://bsky.social/" });

type Post = {
	postUrl: string;
	title: string;
	author: string;
	authorUrl: string;
	imgPath: string;
};

async function postToBsky(post: Post) {
	const { postUrl, title, author, authorUrl, imgPath } = post;
	await agent.login({
		identifier: process.env.BLUESKY_BOT_EMAIL || "email",
		password: process.env.BLUESKY_BOT_PASSWORD || "password",
	});
	const data = fs.readFileSync(imgPath);
	const resp = await agent.uploadBlob(data, {
		encoding: "image/jpeg",
	});
	if (!resp.success) {
		const msg = `🚫 Unable to upload image ${imgPath}`;
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
				features: [
					{
						$type: "app.bsky.richtext.facet#link",
						uri: postUrl,
					},
				],
			},
			{
				index: {
					byteStart: text.indexOf(" u/") + 1,
					byteEnd: text.length,
				},
				features: [
					{
						$type: "app.bsky.richtext.facet#link",
						uri: authorUrl,
					},
				],
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
	console.log("🎉 Skeeted");
}

export { postToBsky };
