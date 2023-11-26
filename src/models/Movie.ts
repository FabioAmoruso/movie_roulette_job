import mongoose, { Document } from "mongoose";

export interface IProvider {
    providerId: number;
    providerName: string;
    providerLogo: string;
    displayPriority: number;
}
export interface IMovie extends Document {
    movieId: number;
    title: string;
    overview: string;
    backdropPath: string;
    posterPath: string;
    adult: boolean;
    originalLanguage: string;
    genreIds: number[];
    popularity: number;
    voteAverage: number;
    releaseDate: Date;
    providers: IProvider[];
}

const MovieSchema = new mongoose.Schema<IMovie>({
    _id: Number,
    title: String,
    overview: String,
    backdropPath: String,
    posterPath: String,
    adult: Boolean,
    originalLanguage: String,
    genreIds: [Number],
    popularity: Number,
    voteAverage: Number,
    releaseDate: Date,
    providers: [Object]
});

export default mongoose.model<IMovie>('Movie', MovieSchema);