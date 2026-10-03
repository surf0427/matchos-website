# Terms of Service — internal drafting notes (not deployed)

These notes go with `public/terms.html` (effective October 3, 2026). They are for the owner,
not for users. Only `public/` is served.

## Owner-provided values used

- Operator: 窪田 慶大 (individual developer), 東京都練馬区下石神井2-8-9, Japan.
- Contact for support, privacy and Terms: surf6589@gmail.com.
- Minimum age: 18. There is no in-app age gate and no date of birth is stored. The Terms state the
  rule; the app does not verify it.

## Implementation facts the Terms rely on (app `208d919d`)

- Accounts are anonymous only. The key stays on the device, and logging out or losing the device
  loses the account. There is no recovery or account linking.
- Coins are iOS-only consumable In-App Purchases. They are spent only on Super Chat. There are no
  transfers, no cash-out and no expiry.
- A Super Chat credits nothing to the streamer. Creator earnings exist only as internal shadow
  accounting (`finance_internal`) with no user-facing surface and amounts of 0. The Terms
  therefore promise no payout.
- When Apple refunds a purchase (App Store Server Notifications V2), the unused Coins from that
  purchase are removed. Spent Coins are recorded as debt and are not collected.
- Account deletion cascades the wallet, so unused Coins are forfeited.
- Reportable targets: profile, Moment, comment, DM, group message, battle and community. Live
  streams and Live comments are not reportable.
- Yellow Cards are automatic and decay. Reaching 10 flags the account for operator review, with no
  automatic suspension. Suspension and ban are done by the operator.
- Battle, 4P, Chat Mode and Train Together calls are not recorded. Mux Live recordings are
  deleted, and no replay is offered.
- Events have no payments. GYM events require the poster to confirm venue permission.

## Legal sources checked (2026-10-03)

**Japan**

- 法の適用に関する通則法 art. 7 lets the parties choose the governing law. Art. 11(1) lets a
  consumer invoke the mandatory rules of their habitual residence. → The Terms use Japanese law and
  preserve the mandatory protections of the user's country of residence.
- 民事訴訟法 art. 3-4(1) and art. 3-7(5): an agreement made before a dispute on the courts for a
  consumer contract is effective only for the courts of the consumer's country of domicile at the
  time the contract was made, or if the consumer relies on it. → No exclusive Tokyo clause. Tokyo
  District Court is a non-exclusive court of first instance.
- 消費者契約法 art. 8:
  - Art. 8(1): a clause fully excluding liability is void.
  - Art. 8(1): a clause partly excluding liability for intent or gross negligence is void.
  - Art. 8(3): a partial limit that does not say it applies only to slight negligence is void.
  - → The liability section states the carve-outs explicitly. It has no blanket "to the maximum
    extent permitted by law" exclusion and no monetary cap.
- 消費者契約法 art. 10 (one-sided clauses) → no indemnity, no unilateral right to decide
  liability, and no exclusive venue.
- 民法 arts. 548-2 to 548-4 (standard terms, 定型約款):
  - Art. 548-2: Terms bind if the user agreed, or if it was shown in advance that the Terms form
    the contract.
  - Art. 548-4: changes are allowed only if they benefit users or are reasonable. The new content
    and the effective date must be published online before the effective date.
  - → Section 21 follows this.

**EU**

- Rome I Regulation art. 6(2): a choice of law cannot deprive a consumer of the mandatory
  protection of their habitual residence.
- Brussels I bis arts. 18–19: a consumer can sue in their own domicile, and pre-dispute
  agreements cannot take this away.

**Not included on purpose:** arbitration, class-action waiver, warranty waivers beyond what the
law allows, any creator payout or revenue split, an IP assignment, an indemnity, and a liability
cap amount.

## Open items for the owner (not blockers for TestFlight)

1. **Terms are not shown in the app.** The app links only to the Privacy Policy (Welcome screen
   and Settings → Privacy). For the Terms to clearly form part of the contract (民法 548-2(1)(ii):
   shown to the user in advance), add a Terms link next to the Privacy link in a later app
   version. Until then, put the Terms URL in the App Store description. This is a product change,
   so it is not made here.
2. **特定商取引法に基づく表記.** Selling Coins to consumers in Japan is likely a 通信販売.
   Japanese apps with in-app purchases usually publish a 特定商取引法 notice: seller, address,
   phone (or "disclosed without delay on request"), price, payment timing, delivery and refunds.
   This was not created because no phone-number decision was given. Confirm with a professional.
3. **資金決済法 (prepaid payment instruments).** Coins bought for money and spent on a service may
   be 自家型前払式支払手段. If unused Coins on 3/31 or 9/30 exceed ¥10,000,000, a notification
   (届出), display duties and refund duties on discontinuation (art. 20) apply. Monitor the unused
   balance.
4. A monetary liability cap and EU/UK representatives (see the Privacy Policy) remain
   owner/lawyer decisions.
