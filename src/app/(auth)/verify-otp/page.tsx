import React, { Suspense } from 'react'
import VerifyOtp from './_components/VerifyOtp'

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <VerifyOtp />
    </Suspense>
  )
}

export default page