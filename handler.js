'use strict';
const DynamoDB = require('aws-sdk/clients/dynamodb');
const documentClient = new DynamoDB.DocumentClient({ region: 'us-east-1' });
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;
const send = (statusCode, body) => {
  return {
  statusCode,
  body: JSON.stringify(body),
}};

module.exports.createNotes = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body);

  try {
    const params = {

      TableName: NOTES_TABLE_NAME,
      Item:{
        notesId: data.id,
        title: data.title,
        body: data.body,

      },
      ConditionExpression : 'attribute_not_exists(notesId)'
    }
    await documentClient.put(params).promise();
    callback(null,send(201, data));
    
  } catch (error) {
    callback(null,send(500, error.message));
  }

};
module.exports.updateNotes = async (event, context, callback) => {

  let noteId = event.pathParameters.id;
  let data = JSON.parse(event.body);

  try {
    
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId: noteId
      },
      UpdateExpression: 'set #title = :title, #body = :body',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body
      },
      ConditionExpression: 'attribute_exists(notesId)',
      
    }
  
      await documentClient.update(params).promise();
      callback(null,send(200, data));
    }  
  catch (error) {
    callback(null, send(500, error.message));
  }}


module.exports.deleteNotes = async (event, context, cb) => {

  let noteId = event.pathParameters.id;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId: noteId
      },
      ConditionExpression: 'attribute_exists(notesId)',
    
    }
    await documentClient.delete(params).promise();
    cb(null, send(200, `Note with id ${noteId} is deleted`));
    
  } catch (error) {
    cb(null, send(500, error.message));
  }



};

module.exports.getAllNotes = async (event) => {
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };
    const result = await documentClient.scan(params).promise();
    return send(200, result.Items);
  } catch (error) {
    return send(500, error.message);
  }

};
