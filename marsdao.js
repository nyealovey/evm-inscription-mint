const fetch = require('node-fetch');
const ethers = require('ethers');

async function main() {
    const rpcUrl = "https://eth1.lava.build/lava-referer-f077e05e-0975-4894-8d22-9eeaad53b03d/";

    // 每次循环生成不同数量的地址并进行查询
    for (let batch = 1; batch <= 5000000; batch++) { // 这里的 5 可以根据需求修改为你希望进行的循环批次
        const numAddresses = Math.floor(Math.random() * 20) + 1; // 生成 1 到 10 之间的随机数量
        const addresses = Array.from({ length: numAddresses }, () => ethers.Wallet.createRandom().address);

        console.log(`批次 ${batch}: 查询 ${numAddresses} 个地址的余额`);

        try {
            const balances = await Promise.all(addresses.map(address => checkBalance(address, rpcUrl)));
            balances.forEach((balance, index) => {
                console.log(`地址: ${addresses[index]} 的余额为: ${balance} ETH`);
            });
        } catch (error) {
            console.error(`查询余额时出错: ${error.message}`);
        }

        const sleepSeconds = Math.floor(Math.random() * 20) + 1; // 生成 1 到 5 之间的随机秒数
        console.log(`等待 ${sleepSeconds} 秒后进行下一次循环`);
        await sleep(sleepSeconds * 100); // 将秒数转换为毫秒并进行沉睡
    }
}

async function fetchRPC(url, body) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
    });

    if (!response.ok) {
        throw new Error(`HTTP 错误! 状态: ${response.status}, 信息: ${await response.text()}`);
    }
    return response.json();
}

async function checkBalance(address, rpcUrl) {
    const jsonRpcPayload = {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
    };

    const response = await fetchRPC(rpcUrl, jsonRpcPayload);
    if (response.error) {
        throw new Error(`RPC 错误: ${response.error.message}`);
    }

    return ethers.utils.formatUnits(response.result, 'ether');
}

// 沉睡函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);

