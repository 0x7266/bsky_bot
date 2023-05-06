import { Submission } from "snoowrap";

export interface GallerySubmission extends Submission {
	is_gallery: boolean;
	media_metadata: {
		[key: string]: {
			status: string;
			e: string;
			m: string;
			p: Array<{ u: string; y: number; x: number }>;
			s: { u: string; y: number; x: number };
			id: string;
		};
	};
}
