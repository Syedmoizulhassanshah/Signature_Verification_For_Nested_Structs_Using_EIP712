// using ethereumjs-util 7.1.3
const ethUtil = require('ethereumjs-util');

// using ethereumjs-abi 0.6.9
const abi = require('ethereumjs-abi');

// for .env file
require('dotenv').config();

const PRIVATEKEY  = process.env.PRIVATEKEY;


const typedData = {
    types: {
        EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
        ],
        LandData: [
            { name: 'metaData', type: 'string' },
            { name: 'season', type: 'string'}
        ],
        MintData: [
            { name: '_tokenId', type: 'uint256' },
            { name: '_tokenMetadataHash', type: 'string' },
            { name: '_landData', type: 'LandData' }
        ],   
    },
    primaryType: 'MintData',
    domain: {
        name: 'WRLDLand',
        version: '1',
        chainId: 4,
    },
    message: {
        _tokenId:1,
        _tokenMetadataHash:'QmT757cQUpNSNaEyDYYv5No7GzRogF3bnTGYxRS98EMcwt',
        _landData: {
            metaData:'This is metadata',
            season:'Season-1',
        },
    },
};

const types = typedData.types;

// Recursively finds all the dependencies of a type
function dependencies(primaryType, found = []) {
    if (found.includes(primaryType)) {
        return found;
    }
    if (types[primaryType] === undefined) {
        return found;
    }
    found.push(primaryType);
    for (let field of types[primaryType]) {
        for (let dep of dependencies(field.type, found)) {
            if (!found.includes(dep)) {
                found.push(dep);
            }
        }
    }
    return found;
}

function encodeType(primaryType) {
    // Get dependencies primary first, then alphabetical
    let deps = dependencies(primaryType);
    deps = deps.filter(t => t != primaryType);
    deps = [primaryType].concat(deps.sort());

    // Format as a string with fields
    let result = '';
    for (let type of deps) {
        result += `${type}(${types[type].map(({ name, type }) => `${type} ${name}`).join(',')})`;
    }
    return result;
}

function typeHash(primaryType) {
    return ethUtil.keccakFromString(encodeType(primaryType), 256);
}

function encodeData(primaryType, data) {
    let encTypes = [];
    let encValues = [];

    // Add typehash
    encTypes.push('bytes32');
    encValues.push(typeHash(primaryType));

    // Add field contents
    for (let field of types[primaryType]) {
        let value = data[field.name];
        if (field.type == 'string' || field.type == 'bytes') {
            encTypes.push('bytes32');
            value = ethUtil.keccakFromString(value, 256);
            encValues.push(value);
        } else if (types[field.type] !== undefined) {
            encTypes.push('bytes32');
            value = ethUtil.keccak256(encodeData(field.type, value));
            encValues.push(value);
        } else if (field.type.lastIndexOf(']') === field.type.length - 1) {
            throw 'TODO: Arrays currently unimplemented in encodeData';
        } else {
            encTypes.push(field.type);
            encValues.push(value);
        }
    }

    return abi.rawEncode(encTypes, encValues);
}

function structHash(primaryType, data) {
    return ethUtil.keccak256(encodeData(primaryType, data));
}

function signHash() {
    return ethUtil.keccak256(
        Buffer.concat([
            Buffer.from('1901', 'hex'),
            structHash('EIP712Domain', typedData.domain),
            structHash(typedData.primaryType, typedData.message),
        ]),
    );
}

const privateKey = ethUtil.toBuffer(PRIVATEKEY, 256) ;
const address = ethUtil.privateToAddress(privateKey);
const sig = ethUtil.ecsign(signHash(), privateKey);


//coded to get the signature values

console.log('This is the required privateKey:', ethUtil.bufferToHex(privateKey));
console.log('This is the required address:', ethUtil.bufferToHex(address));
// console.log('This is the required signature with out spliting:', sig);
console.log('This is the required signature2 buffer v value:', sig.v);
console.log('This is the required signature2 buffer r value:', ethUtil.bufferToHex(sig.r));
console.log('This is the required signature2 buffer s value:', ethUtil.bufferToHex(sig.s));


