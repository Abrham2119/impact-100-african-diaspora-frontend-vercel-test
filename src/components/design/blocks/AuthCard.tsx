import type { ReactNode } from 'react';
import type { CardImage } from './ContentCards';

// The auth screens' layout (sign_in / sign_up / forgot_password / two_step / two_step_enrol
// .dc.html), markup verbatim: the image beside the `sign_up_contant` column.
//   <section class="sign_up mt_100"><div class="container"><div class="row">
//     <div class="col-lg-6 col-xl-7"><div class="sign_up_img"><img …></div></div>
//     <div class="col-lg-6 col-xl-5"><div class="sign_up_contant">…</div></div>
export function AuthCard({ image, children }: { image?: CardImage; children: ReactNode }) {
  return (
    <section className="sign_up mt_100">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 col-xl-7">
            {image && (
              <div className="sign_up_img">
                <img src={image.src} alt={image.alt} className="img-fluid w-100" />
              </div>
            )}
          </div>
          <div className="col-lg-6 col-xl-5">
            <div className="sign_up_contant">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
