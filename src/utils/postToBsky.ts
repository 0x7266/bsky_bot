import fs from "fs";
import { BlobRef, BskyAgent, RichText } from "@atproto/api";

const agent = new BskyAgent({ service: "https://bsky.social/" });

type Post = {
	postUrl: string;
	title: string;
	author: string;
	authorUrl: string;
	imgPaths: string[];
};

async function postToBsky(post: Post) {
	const { postUrl, title, author, authorUrl, imgPaths } = post;
	console.log({imgPaths});
	await agent.login({
		identifier: process.env.BLUESKY_BOT_EMAIL || "email",
		password: process.env.BLUESKY_BOT_PASSWORD || "password",
	});
	const images: BlobRef[] = [];
	for (const imgPath of imgPaths) {
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
		images.push(image);
	}
	const text = `${title}\nby u/${author}\n`;
	console.log({title}, {author})
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
	await agent.post({
		text: rt.text,
		facets: rt.facets,
		embed: {
			$type: "app.bsky.embed.images",
			images: images.slice(images.length - 4).map((image) => ({ image, alt: `${title}_1` })),
		},
	});
	console.log("🎉 Skeeted");
}

export { postToBsky };
