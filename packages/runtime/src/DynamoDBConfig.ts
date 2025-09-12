export const dynamoDBClientConfiguration = process.env['AWS_ENDPOINT_URL_DYNAMODB']
    ? {
          endpoint: process.env['AWS_ENDPOINT_URL_DYNAMODB'],
      }
    : {};

export const documentClientConfig = {
    marshallOptions: {
        removeUndefinedValues: true,
        // This MUST be false when using ElectroDB:
        convertEmptyValues: false,
    },
};

//TODO: remove this and make it configurable via an env variable in the generator
export const singleDBTableName = 'MySingleTableName';
