import mongoose from 'mongoose';
import Logging from './library/Logging';
import { config } from './config/config';
import controller from './controllers/Movie';

mongoose.connect(config.mongo.url,
    {
        retryWrites: true,
        writeConcern: {
            w: 'majority'
        }
    }
).then(() => {
    Logging.info('Connected to MongoDB');
    controller.saveToMongo();
    // controller.clearCollections();

}).catch((error) => {
    Logging.error(error);
});