import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Movie, { IMovie, IProvider } from "../models/Movie";
import axios from "axios";
import { config } from "../config/config";
import Logging from "../library/Logging";

saveToMongo();
// clearCollections();

/** Get all movies from TMDB API*/
async function getTMDBMovies() {
    try {
        const movieRes = await axios.get(`${config.api.baseUrl}/movie/top_rated`, {
            headers: {
                'Authorization': `Bearer ${config.api.apiKey}`,
                'accept': 'application/json'
            }
        });

        return movieRes.data.results;
    } catch (error) {
        Logging.error(error);
    }
}

/** Get all providers from TMDB API */
async function getTMDBProviders(movieId: number) {
    try {
        const providerRes = await axios.get(`${config.api.baseUrl}/movie/${movieId}/watch/providers`, {
            headers: {
                'Authorization': `Bearer ${config.api.apiKey}`,
                'accept': 'application/json'
            }
        });

        return providerRes.data.results;
    } catch (error) {
        Logging.error(error);
    }
}

async function clearCollections() {
    const collections = mongoose.connection.collections;

    await Promise.all(Object.values(collections).map(async (collection) => {
        await collection.deleteMany({}); // an empty mongodb selector object ({}) must be passed as the filter argument
    }));
}

/** Save data to MongoDB */
async function saveToMongo() {
    try {
        const movies = await getTMDBMovies();

        for (const movie of movies) {

            const movieId: number = movie.id;
            const providers = await getTMDBProviders(movieId);

            if ("IT" in providers) {
                if ("flatrate" in providers.IT) {

                    const movieExists = await Movie.findById(movieId);

                    if (!movieExists) {

                        const providersArr: IProvider[] = [...providers.IT.flatrate];

                        const movieToCreate: IMovie = new Movie({
                            _id: movie.id,
                            title: movie.title,
                            overview: movie.overview,
                            backdropPath: `${config.api.imageBaseUrl}${movie.backdrop_path}`,
                            posterPath: `${config.api.imageBaseUrl}${movie.poster_path}`,
                            adult: movie.adult,
                            originalLanguage: movie.original_language,
                            genreIds: movie.genre_ids,
                            popularity: movie.popularity,
                            voteAverage: movie.vote_average,
                            releaseDate: movie.release_date,
                            providers: providersArr
                        });

                        // Logging.info('movie to create: ' + JSON.stringify(movieToCreate));
                        movieToCreate.save();
                    }
                }
            }
        }
    } catch (error) {
        Logging.error(error);
    }
}

/** Update movies with providers from TMDB API */
const updateMovie = (req: Request, res: Response, next: NextFunction, movieId: number) => {

    return Movie.findById(movieId)
        .then(movie => {
            if (movie) {
                movie.set(req.body)

                return movie
                    .save()
                    .then(movie => res.status(201).json({ movie }))
                    .catch(error => res.status(500).json({ error }));
            } else {
                res.status(404).json({
                    message: 'Movie not found'
                })
            }
        })
        .catch(error => res.status(500).json({ error }));
};

/** Get a movie from MongoDB */
const getMovieById = (req: Request, res: Response, next: NextFunction) => {
    const movieId = req.params.movieId;

    return Movie.findById(movieId)
        .then(movie => movie ? res.status(200).json({ movie }) : res.status(404).json({
            message: 'Movie not found'
        }))
        .catch(error => res.status(500).json({ error }));
};

/** Get all movies from MongoDB */
const getMovies = (req: Request, res: Response, next: NextFunction) => {
    return Movie.find()
        .then(movie => res.status(200).json({ movie }))
        .catch(error => res.status(500).json({ error }));
};

/** Delete movie from MongoDB */
const deleteMovie = (req: Request, res: Response, next: NextFunction) => {
    const movieId = req.params.movieId;

    return Movie.findByIdAndDelete(movieId)
        .then(movie => movie ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({
            message: 'Movie not found'
        }))
        .catch(error => res.status(500).json({ error }));
};

export default { getMovieById, getMovies, deleteMovie };