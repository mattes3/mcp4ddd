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

// Configurable via DYNAMODB_TABLE_NAME environment variable for single-table design
export const singleDBTableName = process.env['DYNAMODB_TABLE_NAME'] ?? 'MySingleDynamoDBTable';
