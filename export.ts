import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import fs from 'fs';

type Target = 'firestore' | 'authentication';
initializeApp({
  credential: applicationDefault()
});

let target: Target = 'firestore';

const getFirestoreDocuments = async () => {
  const collectionName = process.argv[2]; // Takes the second argument of the terminal command
  const db = getFirestore();
  const querySnapshot = await db.collection(collectionName).get();
  const queryDocumentSnapshot = querySnapshot.docs;

  return queryDocumentSnapshot.map((document) => {
    const documentData = document.data();

    // Change to match the fields in the document
    return {
      name: documentData.name
    };
  });
};

const getAuthentication = async () => {
  const records = await getAuth().listUsers(10);
  const users = records.users;
  return users.map((user) => {
    return {
      name: user.displayName,
      email: user.email
    };
  });
};

const exportJson = (data: Object) => {
  fs.writeFile('./json/export.json', JSON.stringify(data), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('success!');
  });
};

const main = async () => {
  let data;
  switch (target) {
    case 'firestore':
      data = await getFirestoreDocuments();
      break;
    case 'authentication':
      data = await getAuthentication();
      break;
  }
  const keys = Object.keys(data[0]);
  console.log('Document Key:', keys.toString()); // Used in CLI when csv conversion

  exportJson(data);
};

main();
