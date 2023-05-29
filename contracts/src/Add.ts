import {
  Field,
  SmartContract,
  state,
  State,
  method,
  MerkleWitness,
  PublicKey,
  AccountUpdate,
} from 'snarkyjs';

class MerkleWitness4 extends MerkleWitness(4) {}
/**
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 *
 * This file is safe to delete and replace with your own contract.
 */

export class Add extends SmartContract {
  @state(Field) nextIndex = State<Field>();

  // Dubai Association of Medical Doctors (UAE)
  @state(PublicKey) cpsoPublicKey = State<PublicKey>();

  // We use a field instead of an Int64 because there's a limit on the range of values allowable in Snarky
  @state(Field) root = State<Field>();

  @method initState(cpsoPublicKey: PublicKey, initRoot: Field) {
    this.cpsoPublicKey.set(cpsoPublicKey);
    this.root.set(initRoot);
    this.nextIndex.set(Field(0));
  }

  @method addDoctor(
    cpsoPrivateKey: PrivateKey,
    doctor: PublicKey,
    leafWitness: MerkleWitness4
  ) {
    // Circuit Assertion
    const commitedPublicKey = this.cpsoPublicKey.get();
    this.cpsoPublicKey.assertEquals(commitedPublicKey);

    // Check that the Public Key is the same as the one on the contract
    commitedPublicKey.assertEquals(cpsoPrivateKey.toPublicKey());

    const initialRoot = this.root.get();
    this.root.assertEquals(initialRoot);

    this.nextIndex.assertEquals(leafWitness.calculateIndex());

    const newRoot = leafWitness.calculateRoot(doctor.x);
    this.root.set(newRoot);

    // Set new Index
    const currIndex = this.nextIndex.get();
    this.nextIndex.assertEquals(currIndex);
    this.nextIndex.set(currIndex.add(Field(1)));
  }

  @method verifySickNote(
    doctorWitness: MerkleWitness4,
    doctorPubkey: PublicKey,
    signature: Signature,
    patientPubKey: PublicKey
  ) {
    //Verify that the doctor is in the list of doctors
    this.root.assertEquals(doctorWitness.calculateRoot(doctorPubkey.x));

    const ok = signature.verify(doctorPubkey, patientPubKey.toFields());
    ok.assertTrue();
  }
}
