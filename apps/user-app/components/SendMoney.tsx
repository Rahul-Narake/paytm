'use client';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { TextInput } from '@repo/ui/textinput';
import { useState } from 'react';
import { sendMoney } from '../lib/actions/sendMoney';

export default function SendMoney() {
  const [number, setNumber] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  return (
    <Card title="Send Money">
      <div className="flex flex-col space-y-2">
        <TextInput
          label="Number"
          onChange={(value) => {
            setNumber(value);
          }}
          placeholder="################"
        />
        <TextInput
          label="Amount"
          onChange={(val) => {
            setAmount(Number(val));
          }}
          placeholder="################"
        />
        <Button
          onClick={async () => {
            const resp = await sendMoney(number, Number(amount) * 100);
            console.log(resp);
          }}
        >
          Send
        </Button>
      </div>
    </Card>
  );
}
