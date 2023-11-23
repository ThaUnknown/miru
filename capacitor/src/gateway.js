import { gateway4async } from 'capacitor-default-gateway'

let v4Gateway

export const v4 = () => {}
v4.sync = () => v4Gateway
export const ready = gateway4async().then(gateway => {
  v4Gateway = gateway
})
