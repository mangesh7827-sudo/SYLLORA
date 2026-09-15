import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { StateView } from '@/components/ui/StateView';
export function FeatureEmpty({message,action}:{message:string;action?:ReactNode}){return <Card className="phase8-empty"><StateView state="empty" message={message}/>{action}</Card>;}
