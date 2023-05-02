import "dotenv/config";
import fs from "fs";
import Snoowrap from "snoowrap";
import { SubmissionStream } from "snoostorm";
import Jimp from "jimp";
import { postToBsky } from "./at";
import { downloadImage } from "./downloadImage";

const r = new Snoowrap({
	userAgent: "reddit-bot-example-node",
	clientId: process.env.REDDIT_CLIENT_ID,
	clientSecret: process.env.REDDIT_CLIENT_SECRET,
	username: process.env.REDDIT_USER,
	password: process.env.REDDIT_PASSWORD,
});

const stream = new SubmissionStream(r, { subreddit: "unixporn", limit: 1 });

stream.on("item", async (post) => {
	const { permalink, title, author, is_video } = post;
	let url = "https://i.redd.it/ny2gw16elgxa1.png";
	const path = `./images/${url.slice(18)}`;
	if (is_video) {
		console.log("🚫 New post is a video");
		return;
	}
	await downloadImage(url, path);
	let imgInfo = fs.statSync(path);
	let fileSizeMB = imgInfo.size / (1024 * 1024);
	if (fileSizeMB > 1) {
		console.log(`🚨 File is too large: ${fileSizeMB} MB`);
		const image = await Jimp.read(path);
		image.resize(Jimp.AUTO, 1080);
		await image.writeAsync(path);
		let resizedImgInfo = fs.statSync(path);
		let resizedFileSizeMB = resizedImgInfo.size / (1024 * 1024);
		console.log(`✅ Resized: ${resizedFileSizeMB} MB`);
	}
	await postToBsky({
		postUrl: permalink,
		title,
		author: author.name,
		imageUrl: url,
		path,
	});
});
