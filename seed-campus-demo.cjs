#!/usr/bin/env node
/* CampusPulse demo importer. Run locally; never place a service-account key in the Android app or website. */
const fs = require('node:fs');
const PROJECT = 'campus-pulse-ump';
const BATCH = 'campuspulse-demo-five-clubs-v1';
const clubs = [
  {id:'demo-rainbow-alliance',name:'Rainbow Alliance',short:'Rainbow',category:'IDENTITY',interest:['5','10'],description:'A welcoming community for LGBTQ+ students and allies, promoting belonging, respect and mutual support.',location:'Student Centre — demo venue',event:'Rainbow Alliance Welcome Circle',hour:15,posts:['Everyone belongs. Meet Rainbow Alliance and discover a welcoming space for LGBTQ+ students and allies.','Our next welcome circle includes introductions, community conversations and ways to get involved. All allies are welcome.','Respect, privacy and kindness guide our community. Join the club to stay connected with upcoming activities.'],leaders:[['Naledi Mokoena','Chairperson'],['Thabo Dlamini','Secretary'],['Lerato Nkosi','Community Coordinator']]},
  {id:'demo-ump-choir',name:'UMP Choir',short:'UMP Choir',category:'CULTURE',interest:['7','8'],description:'A student choir bringing voices together through rehearsals, performances and a shared love of music.',location:'Music rehearsal room — demo venue',event:'UMP Choir Open Rehearsal',hour:17,posts:['Love singing? UMP Choir welcomes new voices. Join us for an open rehearsal and meet fellow music lovers.','From warm-ups to harmonies, our rehearsal sessions focus on teamwork and confidence. Beginners are welcome.','A little practice makes a big difference. Follow UMP Choir for rehearsal announcements and performance updates.'],leaders:[['Zinhle Khumalo','Choir Chairperson'],['Sipho Maseko','Music Coordinator'],['Ayanda Mokoena','Secretary']]},
  {id:'demo-tennis-club',name:'Tennis Club',short:'Tennis',category:'SPORT',interest:['6'],description:'Social and competitive tennis for students of all experience levels, with practice sessions and friendly matches.',location:'Campus tennis courts — demo venue',event:'Tennis Club Beginners Social',hour:16,posts:['New to tennis or returning to the court? Tennis Club welcomes students of all skill levels.','Our next social session includes basic drills, rally practice and friendly games. Bring water and comfortable sportswear.','Good sportsmanship comes first. Join Tennis Club to receive updates about practice sessions and friendly matches.'],leaders:[['Kabelo Ndlovu','Club Captain'],['Nomsa Dube','Secretary'],['Tumelo Mokoena','Training Coordinator']]},
  {id:'demo-netball',name:'Netball',short:'Netball',category:'SPORT',interest:['6'],description:'A student netball community developing teamwork, fitness and court skills through training and social games.',location:'Campus netball courts — demo venue',event:'Netball Skills and Social Session',hour:16,posts:['Ready to get moving? Join our netball community for teamwork, fitness and friendly competition.','Passing, footwork and shooting are the focus of our next skills session. New players are welcome.','Support your teammates, enjoy the game and keep improving. Follow Netball for training announcements.'],leaders:[['Boitumelo Molefe','Team Captain'],['Nokuthula Maseko','Vice Captain'],['Palesa Dlamini','Secretary']]},
  {id:'demo-womens-basketball',name:"Women's Basketball",short:'Women’s Basketball',category:'SPORT',interest:['6'],description:'A supportive basketball community for women students, building confidence, fitness and teamwork on and off the court.',location:'Campus basketball court — demo venue',event:"Women's Basketball Open Practice",hour:17,posts:["Women’s Basketball is welcoming new players. Come learn, train and build confidence with the team.",'Our open practice includes ball handling, shooting drills and a friendly scrimmage. All experience levels are welcome.','Teamwork goes beyond the court. Join the club for practice updates and opportunities to get involved.'],leaders:[['Refilwe Nkosi','Team Captain'],['Amahle Dube','Vice Captain'],['Karabo Maseko','Secretary']]}
];
function buildRecords(now = new Date()) {
  const records = [];
  const iso = d => d.toISOString();
  // Dates use fixed South African UTC+02:00, which has no seasonal clock change.
  const local = new Date(now.getTime()+2*60*60*1000);
  const day = local.toISOString().slice(0,10);
  const base = new Date(day+'T00:00:00+02:00');
  clubs.forEach((c,index) => {
    const stamp = iso(now);
    records.push({path:'clubs/'+c.id,data:{name:c.name,shortName:c.short,category:c.category,description:c.description+' Demonstration profile.',history:'Prepared for the CampusPulse demonstration. This is illustrative content, not an official club history.',location:c.location,profileImageUrl:'',bannerImageUrl:'',organisationType:'CLUB',status:'APPROVED',isActive:true,createdAt:stamp,updatedAt:stamp,demoBatch:BATCH,interestIds:c.interest}});
    c.posts.forEach((text,j) => {
      const date = new Date(now.getTime()-(j*18+index)*60*60*1000);
      records.push({path:'posts/'+c.id+'-post-'+(j+1),data:{clubId:c.id,clubName:c.name,clubShortName:c.short,authorId:'demo-content-author',type:'TEXT',text:'[DEMO] '+text,imageUrl:'',status:'PUBLISHED',isActive:true,createdAt:iso(date),updatedAt:iso(date),demoBatch:BATCH}});
    });
    const start = new Date(base.getTime()+(index+1)*86400000+c.hour*3600000);
    const end = new Date(start.getTime()+90*60000);
    const localStart = new Date(start.getTime()+7200000).toISOString();
    const localEnd = new Date(end.getTime()+7200000).toISOString();
    records.push({path:'events/'+c.id+'-event-1',data:{clubId:c.id,clubName:c.name,clubShortName:c.short,authorId:'demo-content-author',title:'[DEMO] '+c.event,description:'Illustrative event for the CampusPulse presentation. The venue and schedule are examples, not a confirmed university event.',category:c.category,location:c.location,date:localStart.slice(0,10),time:localStart.slice(11,16),eventDate:iso(start),endDate:localEnd.slice(0,10),endTime:localEnd.slice(11,16),eventEndDate:iso(end),rsvpEnabled:false,rsvpUrl:'',mediaType:'PHOTO',mediaUrl:'',imageUrl:'',videoUrl:'',status:'PUBLISHED',isActive:true,createdAt:stamp,updatedAt:stamp,history:'Demo event',demoBatch:BATCH}});
    c.leaders.forEach(([name,role],i) => records.push({path:'clubs/'+c.id+'/leadership/demo-leader-'+(i+1),data:{userId:'',membershipId:'',name:name+' (Demo)',role,order:i,isActive:true,photoUrl:'',bio:'Fictional leadership profile for demonstration purposes.',updatedAt:stamp,demoBatch:BATCH}}));
  });
  return records;
}
async function main() {
  const args=process.argv.slice(2);
  if (!args.includes('--apply')) {
    console.log('PREVIEW ONLY — no Firebase connection or writes.');
    console.table(clubs.map(c=>({club:c.name,category:c.category,posts:3,events:1,leaders:3})));
    console.log('40 new documents: 5 clubs, 15 posts, 5 events and 15 fictional leaders.');
    console.log('No users, memberships, admin permissions, or existing clubs are changed.');
    console.log('To import: node seed-campus-demo.cjs --apply --key "FULL_PATH_TO_PRIVATE_KEY.json"');
    return;
  }
  const keyIndex=args.indexOf('--key');
  const keyPath=keyIndex>=0 ? args[keyIndex+1] : '';
  if (!keyPath) throw Error('Supply --key followed by the path to your private Firebase service-account JSON file.');
  const account=JSON.parse(fs.readFileSync(keyPath,'utf8'));
  if (account.project_id!==PROJECT || account.type!=='service_account') throw Error('Wrong credentials. Expected a service account for '+PROJECT+'. Nothing was imported.');
  if (process.env.FIRESTORE_EMULATOR_HOST) throw Error('FIRESTORE_EMULATOR_HOST is set. Unset it before importing into your real project.');
  let sdk,firestore;
  try {sdk=require('firebase-admin/app');firestore=require('firebase-admin/firestore');}
  catch {throw Error('Install the importer dependency first: npm install firebase-admin');}
  const app=sdk.initializeApp({credential:sdk.cert(account),projectId:PROJECT});
  const db=firestore.getFirestore(app);
  const records=buildRecords();
  const refs=records.map(r=>db.doc(r.path));
  const dateFields=new Set(['createdAt','updatedAt','eventDate','eventEndDate']);
  const dataFor = record => Object.fromEntries(Object.entries(record.data).map(([k,v])=>[k,dateFields.has(k)?firestore.Timestamp.fromDate(new Date(v)):v]));
  try {
    const result=await db.runTransaction(async tx=>{
      const existing=await tx.getAll(...refs);
      if (existing.every(doc=>doc.exists && doc.get('demoBatch')===BATCH)) return 'already-imported';
      if (existing.some(doc=>doc.exists)) throw Error('One or more demo document IDs already exist. Nothing was overwritten or imported.');
      records.forEach((r,i)=>tx.create(refs[i],dataFor(r)));
      return 'imported';
    });
    console.log(result==='imported' ? 'Imported 5 clubs, 15 posts, 5 events and 15 leadership profiles into '+PROJECT+'.' : 'These demo records already exist. No duplicate records were created.');
    console.log('Open the mobile Directory. Join a club there to make it appear in My Clubs.');
    console.log('Home shows posts according to its selected day/week. Events are scheduled over the next five days.');
    console.log('Profile photos and banners are empty; phone media uploading is not enabled by this importer.');
  } finally {await sdk.deleteApp(app);}
}
if (require.main===module) main().catch(error=>{console.error('Import failed:',error.message);process.exitCode=1;});
module.exports={buildRecords,clubs};
