import React, { Suspense } from 'react'
import ChangePassword from './_components/ChangePassword'

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <ChangePassword />
    </Suspense>
  )
}

export default page