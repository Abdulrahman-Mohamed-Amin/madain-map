export interface News {
    id: number;

    arTitle: string;
    enTitle: string;
    arDescription: string;
    enDescription: string;
    date: string;
    imagePaths: string[];

    videoPath: string | null;
}
