import fs from "fs";
import Jimp from "jimp";

async function compressImage(imgSize: number, imgPath: string) {
	console.log(`🚨 File is too large: ${imgSize}`);
	const image = await Jimp.read(imgPath);
	image.resize(1280, Jimp.AUTO);
	await image.writeAsync(imgPath);
	let resizedImgSize = fs.statSync(imgPath).size;
	console.log(`✅ Resized: ${resizedImgSize}`);
	// if (resizedImgSize > 976560)  {}
}

export { compressImage };
