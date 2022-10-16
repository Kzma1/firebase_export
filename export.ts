import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { ServiceAccount } from 'firebase-admin/app';
import serviceAccount from './key/export-firebase-csv-firebase-adminsdk.json';

import fs from 'fs';

type Target = 'firestore' | 'authentication';
initializeApp({
  // credential: applicationDefault()
  credential: cert(serviceAccount as ServiceAccount)
});

let target: Target = 'firestore';

const getFirestoreDocuments = async () => {
  const collectionName = process.argv[2]; //ターミナルコマンドの2番目の引数を取ってきます
  const db = getFirestore();
  const querySnapshot = await db.collection(collectionName).get();
  const queryDocumentSnapshot = querySnapshot.docs;

  return queryDocumentSnapshot.map((document) => {
    const documentData = document.data();

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
    console.log('JSONファイルのエクスポート成功!');
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
  console.log('csv変換時にコマンドで使用する', keys.toString());
  exportJson(data);
};

main();
