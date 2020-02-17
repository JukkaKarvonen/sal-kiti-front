import ParseSiusData from "@/utils/ParseSiusData";

const TestData = [
  [
    "",
    "",
    "",
    "",
    "",
    "",
    "Test competition",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "",
    "Rank",
    "FP",
    "",
    "Bib No",
    "Name",
    "",
    "",
    "",
    "Nation",
    "",
    "Position",
    "Series",
    "",
    "",
    "Sub Total",
    "Total",
    "",
    "",
    "Remarks",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "1",
    "2",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "",
    "1",
    "90",
    "",
    "3456789",
    "ARCHER Master",
    "",
    "",
    "",
    "LC",
    "",
    "Kneeling",
    "100",
    "99",
    "",
    "199",
    "",
    "",
    "",
    "Test remark",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Prone",
    "100",
    "100",
    "",
    "200",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Standing",
    "99",
    "98",
    "",
    "197",
    "596-49x",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "",
    "2",
    "89",
    "",
    "1234567",
    "ATHLETE Apprentice",
    "",
    "",
    "",
    "Village",
    "",
    "Kneeling",
    "100",
    "97",
    "",
    "197",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Prone",
    "99",
    "97",
    "",
    "196",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Standing",
    "99",
    "98",
    "",
    "197",
    "590-43x",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "",
    "Summary",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ]
];

describe("ParseSiusData.js", () => {
  it("Parse sius test data", () => {
    let result = ParseSiusData(TestData);
    expect(result).toEqual([
      {
        first_name: "Master",
        info: "Test remark",
        "kneel-1": "100",
        "kneel-2": "99",
        "ksum-1": "199",
        last_name: "ARCHER",
        organization: "LC",
        position: 1,
        "prone-1": "100",
        "prone-2": "100",
        "psum-1": "200",
        result: "596",
        sport_id: "3456789",
        "ssum-1": "197",
        "stand-1": "99",
        "stand-2": "98",
        "x-1": "49"
      },
      {
        first_name: "Apprentice",
        "kneel-1": "100",
        "kneel-2": "97",
        "ksum-1": "197",
        last_name: "ATHLETE",
        organization: "Village",
        position: 2,
        "prone-1": "99",
        "prone-2": "97",
        "psum-1": "196",
        result: "590",
        sport_id: "1234567",
        "ssum-1": "197",
        "stand-1": "99",
        "stand-2": "98",
        "x-1": "43"
      }
    ]);
  });
});
