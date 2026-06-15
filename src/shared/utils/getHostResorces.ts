/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import https from 'https';
import axios from 'axios';
function calculateResurces(
 resource: {
  maximum: string;
  usage: number;
 },
 sharedNumber: number = 1,
) {
 const resourceTotal = parseInt(resource?.maximum) / sharedNumber;
 const resourceUsed = parseInt(String(resource?.usage)) / sharedNumber;
 const resourceFree = resourceTotal - resourceUsed;

 return {
  resourceTotal: Number(resourceTotal.toFixed(2)),
  resourceUsed: Number(resourceUsed.toFixed(2)),
  resourceFree: Number(resourceFree.toFixed(2)),
 };
}
export default async function getHostResorces() {
 const username = process.env.HOST_USERNAME;
 const password = process.env.HOST_PASSWORD;

 const auth = Buffer.from(`${username}:${password}`).toString('base64');

 try {
  const res = await axios.get<{
   data: {
    find(arg0: (item: any) => boolean): {
     maximum: string;
     usage: number;
    };
    id: string;
    maximum: string;
    usage: number;
   };
  }>('https://cip1.mizbanfadns.net:2083/execute/ResourceUsage/get_usages', {
   headers: { Authorization: `Basic ${auth}` },
   httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });
  if (res.data) {
   const diskUsage = res.data?.data.find((item) => item.id === 'disk_usage');
   //    Number of Processes
   const lvenproc = res.data?.data.find((item) => item.id === 'lvenproc');
   //    memory
   const lvememphy = res.data?.data.find((item) => item.id === 'lvememphy');
   //   entry process
   const lveep = res.data?.data.find((item) => item.id === 'lveep');
   //   CPU Usage
   const lvecpu = res.data?.data.find((item) => item.id === 'lvecpu');
   //   Database Disk Usage
   const cachedmysqldiskusage = res.data?.data.find(
    (item) => item.id === 'cachedmysqldiskusage',
   );
   const sharedNumber = 1073741824;
   const diskUsageObject = calculateResurces(diskUsage, sharedNumber);
   const processNumber = calculateResurces(lvenproc);
   const memory = calculateResurces(lvememphy, sharedNumber);
   const processEntry = calculateResurces(lveep);
   const cpuUsage = calculateResurces(lvecpu);
   const databaseUsage = calculateResurces(cachedmysqldiskusage, sharedNumber);
   return {
    diskUsageObject,
    processNumber,
    memory,
    processEntry,
    cpuUsage,
    databaseUsage,
   };
  }
 } catch (error) {
  console.error('API Error:', error);
 }
}
